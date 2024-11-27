import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Neo4jConnectionService } from 'src/neo4j-connection/neo4j-connection.service';
import { Session } from 'neo4j-driver';
import { EngagementDto } from 'src/cart/dto/engagement.dto';
import { async } from 'rxjs';
@Injectable()
export class CartService {

  constructor(private readonly neo4jService: Neo4jConnectionService) { }

  async getProductsOfCart(userEmail: string) {
    const session: Session = await this.neo4jService.getSession();

    //Valido que exista el usuario
    const user = await session.run(
      'MATCH (u:User {userEmail: $userEmail}) RETURN u',
      { userEmail: userEmail }
    )
    if (user.records.length === 0) {
      await session.close();
      throw new NotFoundException('No se encontró el usuario')
    }
    try {
      // Busco los productos en el carrito y su cantidad
      const result = await session.run(
        `MATCH (c:Cart {userEmail: $userEmail})-[r:REGISTER]->(p:Product)
        RETURN p, toInteger(r.quantity) AS quantity`, // Convertir a número
        { userEmail: userEmail }
      );
      if (result.records.length === 0) {
        return []
      }

      // Extraigo los productos y sus cantidades
      const products = result.records.map(record => {
        const productProperties = record.get('p').properties;
        const quantity = record.get('quantity').low; // Obtiene la cantidad ya convertida a número
        return [productProperties, quantity]; // Devuelve un arreglo con propiedades del producto y cantidad
      });

      return products
    } catch {
      await session.close()
      throw new InternalServerErrorException('Error al obtener los productos del carrito')
    }
  }

  async getCategoryName(categoryId: string) {
    const session: Session = await this.neo4jService.getSession();
    const result = await session.run(
      `MATCH (c:Category {categoryId: $categoryId}) 
      RETURN c.name AS categoryName`,
      { categoryId: categoryId }
    )
    await session.close();
    return result.records[0].get('categoryName');
  }

  //Recibe la compra
  async getCategoriesToEngagement(purchase: Array<any>) {
    const session: Session = await this.neo4jService.getSession();
    try {
      // Busco las categorías de los productos que ha comprado el usuario
      // Ir contando los productos de cada categoría, casos: si solo hay un producto en el carrito, si hay más de uno

      // Si solo hay un producto, se le asigna a categoryID1
      if (purchase.length === 1) {
        const categoryId = purchase[0][0].categoryID;
        // Busco el nombre de la categoría
        const name = await this.getCategoryName(categoryId);
        return { categoryId, name }
      }

      //Si hay mas de un producto, se asigna a categoryID1, categoryID2 y categoryID3
      // reviso todos los productos y voy sumando
      // Ej: {categoryID1: 2, categoryID2: 1, categoryID3: 0}
      const categories = purchase.reduce((acc, product) => {
        const categoryID = product[0].categoryID;
        if (acc[categoryID]) {
          acc[categoryID] += 1;
        } else {
          acc[categoryID] = 1;
        }
        return acc;
      }, {});
      return categories
      // {
      //   se espera un objeto con entries de categorias y values de la cantidad
      //   cat_n: m
      // }
    } catch {
      await session.close()
      throw new InternalServerErrorException('Error al obtener las categorías de los productos')
    }
  }

  //Recibe el objeto
  async getTopTwoCategories(categories: { [key: string]: number }) {
    // Convertir el objeto en un arreglo de [clave, valor]
    const categoryArray = Object.entries(categories);

    // Ordenar el arreglo por la cantidad de productos (valor) en orden descendente
    categoryArray.sort((a, b) => b[1] - a[1]);
    // Obtener las tres primeras categorías
    const topThree = categoryArray.slice(0, 2);
    // Convertir el resultado a un formato deseado (por ejemplo, solo los nombres de las categorías)
    return topThree.map(([categoryId, count]) => ({ categoryId, count }));
    // [ Ej esperado
    //   { categoryID: 'cat_1', count: 16 },
    //   { categoryID: 'cat_4', count: 10 }
    // ]
  }

  async createEngagement(categoryId: string, engagementDTO: EngagementDto) {

    const { userEmail, date } = engagementDTO;
    const session: Session = await this.neo4jService.getSession();

    try {
      const resultCountEngagements = await session.run(
        'MATCH (e:Engagement) RETURN count(e)'
      );
      const temCount = resultCountEngagements.records[0].get('count(e)').low;
      const count = (temCount + 1).toString();
      // Busco el nombre de la categoria
      const name = await this.getCategoryName(categoryId);

      // Creo el engagement
      // 1. Modificar o crear el nodo Engagement
        const engagementResult = await session.run(
          `
            MERGE (e:Engagement {userEmail: $userEmail})
            ON CREATE SET e.categoryId = $categoryId, e.categoryName = $name, e.engagementId = $count
            ON MATCH SET e.categoryId = $categoryId, e.categoryName = $name, e.engagementId = $count
            RETURN e
            `,
          {
            categoryId: categoryId,
            name: name,
            userEmail,
            count
          }
        );

        // Validación del nodo Engagement
        if (engagementResult.records.length === 0) {
          console.error('No se pudo crear o actualizar el nodo Engagement.');
          return { message: 'Error al crear o actualizar el nodo Engagement' };
        } else {
          const engagementNode = engagementResult.records[0].get('e');
          if (!engagementNode) {
            console.error('El nodo Engagement no se creó ni se actualizó correctamente.');
            return { message: 'Error al crear o actualizar el nodo Engagement' };
          }
          console.log('Nodo Engagement creado o actualizado:', engagementNode);
        }

        // 2. Modificar o crear la relación ENGAGE
        const engageResult = await session.run(
          `
            MATCH (e:Engagement {userEmail: $userEmail, categoryId: $categoryId})
            MATCH (u:User {userEmail: $userEmail})
            MERGE (e)-[engageRel:ENGAGE]->(u)
            ON CREATE SET engageRel.date = $date
            ON MATCH SET engageRel.date = $date
            RETURN engageRel
            `,
          {
            categoryId: categoryId,
            userEmail,
            date
          }
        );
        // Validación de la relación ENGAGE
        if (engageResult.records.length === 0) {
          console.error('No se pudo crear o actualizar la relación ENGAGE.');
          return { message: 'Error al crear o actualizar la relación ENGAGE' };
        } else {
          const engageRelation = engageResult.records[0].get('engageRel');
          if (!engageRelation) {
            console.error('La relación ENGAGE no se creó ni se actualizó correctamente.');
            return { message: 'Error al crear o actualizar la relación ENGAGE' };
          }
          console.log('Relación ENGAGE creada o actualizada:', engageRelation);
        }

        // 3. Modificar o crear la relación CATEGORY_SAVED
        const categorySavedResult = await session.run(
          `
            MATCH (cart:Cart {userEmail: $userEmail})
            MATCH (e:Engagement {userEmail: $userEmail, categoryId: $categoryId})
            MERGE (cart)-[r:CATEGORY_SAVED]->(e)
            ON CREATE SET r.savedDate = $date
            ON MATCH SET r.savedDate = $date
            RETURN r
            `,
          {
            userEmail,
            date,
            categoryId: categoryId
          }
          
        );
        // Validación de la relación CATEGORY_SAVED
        if (categorySavedResult.records.length === 0) {
          console.error('No se pudo crear o actualizar la relación CATEGORY_SAVED.');
          return { message: 'Error al crear o actualizar la relación CATEGORY_SAVED' };
        } else {
          const categorySavedRelation = categorySavedResult.records[0].get('r');
          if (!categorySavedRelation) {
            console.error('La relación CATEGORY_SAVED no se creó ni se actualizó correctamente.');
            return { message: 'Error al crear o actualizar la relación CATEGORY_SAVED' };
          }
          console.log('Relación CATEGORY_SAVED creada o actualizada:', categorySavedRelation);
        }

        return { message: 'Engagement y relaciones creadas o actualizadas correctamente' };
      } catch (error) {
        console.error('Error al crear o actualizar el engagement:', error);
        return { message: 'Error al crear o actualizar el engagement' };
      }
  }

  async purchaseProducts(engagementDto: EngagementDto) {

    const { userEmail, date } = engagementDto;

    const session: Session = await this.neo4jService.getSession();

    //Guardo el carrito en una variable
    const purchase = await this.getProductsOfCart(userEmail)

    // Borro las relaciones que salen de carrito c:Cart - r -> (),
    // las relaciones de ADD_PRODUCT y pongo en 0 el totalAmount y totalQuantity
    const result = await session.run(
      `MATCH (c:Cart {userEmail: $userEmail})-[r:REGISTER]->()
      SET c.totalAmount = 0, c.totalQuantity = 0
      DELETE r
      WITH c
      MATCH (u:User {userEmail: $userEmail})-[r:ADD_PRODUCT]->(c)
      DELETE r`,
      { userEmail: userEmail }
    )

    // Extraigo las categorias
    const allCategories = await this.getCategoriesToEngagement(purchase)
    if (allCategories.name !== undefined) {
      const resultCountEngagements = await session.run('MATCH (e:Engagement) RETURN count(e)');
      const temCount = resultCountEngagements.records[0].get('count(e)').low;
      const count = (temCount + 1).toString();
      // Creo el engagement
      try {
        // 1. Modificar o crear el nodo Engagement
        const engagementResult = await session.run(
          `
            MERGE (e:Engagement {userEmail: $userEmail})
            ON CREATE SET e.categoryId = $categoryId, e.categoryName = $name, e.engagementId = $count
            ON MATCH SET e.categoryId = $categoryId, e.categoryName = $name, e.engagementId = $count
            RETURN e
            `,
          {
            categoryId: allCategories.categoryId,
            name: allCategories.name,
            userEmail,
            count
          }
        );

        // Validación del nodo Engagement
        if (engagementResult.records.length === 0) {
          console.error('No se pudo crear o actualizar el nodo Engagement.');
          return { message: 'Error al crear o actualizar el nodo Engagement' };
        } else {
          const engagementNode = engagementResult.records[0].get('e');
          if (!engagementNode) {
            console.error('El nodo Engagement no se creó ni se actualizó correctamente.');
            return { message: 'Error al crear o actualizar el nodo Engagement' };
          }
          console.log('Nodo Engagement creado o actualizado:', engagementNode);
        }

        // 2. Modificar o crear la relación ENGAGE
        const engageResult = await session.run(
          `
            MATCH (e:Engagement {userEmail: $userEmail, categoryId: $categoryId})
            MATCH (u:User {userEmail: $userEmail})
            MERGE (e)-[engageRel:ENGAGE]->(u)
            ON CREATE SET engageRel.date = $date
            ON MATCH SET engageRel.date = $date
            RETURN engageRel
            `,
          {
            categoryId: allCategories.categoryId,
            userEmail,
            date
          }
        );
        // Validación de la relación ENGAGE
        if (engageResult.records.length === 0) {
          console.error('No se pudo crear o actualizar la relación ENGAGE.');
          return { message: 'Error al crear o actualizar la relación ENGAGE' };
        } else {
          const engageRelation = engageResult.records[0].get('engageRel');
          if (!engageRelation) {
            console.error('La relación ENGAGE no se creó ni se actualizó correctamente.');
            return { message: 'Error al crear o actualizar la relación ENGAGE' };
          }
          console.log('Relación ENGAGE creada o actualizada:', engageRelation);
        }

        // 3. Modificar o crear la relación CATEGORY_SAVED
        const categorySavedResult = await session.run(
          `
            MATCH (cart:Cart {userEmail: $userEmail})
            MATCH (e:Engagement {userEmail: $userEmail, categoryId: $categoryId})
            MERGE (cart)-[r:CATEGORY_SAVED]->(e)
            ON CREATE SET r.savedDate = $date
            ON MATCH SET r.savedDate = $date
            RETURN r
            `,
          {
            userEmail,
            date,
            categoryId: allCategories.categoryId
          }
        );
        // Validación de la relación CATEGORY_SAVED
        if (categorySavedResult.records.length === 0) {
          console.error('No se pudo crear o actualizar la relación CATEGORY_SAVED.');
          return { message: 'Error al crear o actualizar la relación CATEGORY_SAVED' };
        } else {
          const categorySavedRelation = categorySavedResult.records[0].get('r');
          if (!categorySavedRelation) {
            console.error('La relación CATEGORY_SAVED no se creó ni se actualizó correctamente.');
            return { message: 'Error al crear o actualizar la relación CATEGORY_SAVED' };
          }
          console.log('Relación CATEGORY_SAVED creada o actualizada:', categorySavedRelation);
        }

        return { message: 'Engagement y relaciones creadas o actualizadas correctamente' };
      } catch (error) {
        console.error('Error al crear o actualizar el engagement:', error);
        return { message: 'Error al crear o actualizar el engagement' };
      }
    }

    // Si {} tiene mas de una categoria tomo la primera que es la mas comprada
    const top2Categories = await this.getTopTwoCategories(allCategories)
    const firstCategory = top2Categories[0];
    const categoryId = firstCategory.categoryId;

    // Creo los engagement
    await this.createEngagement(categoryId, engagementDto);
    return purchase
  }
}
