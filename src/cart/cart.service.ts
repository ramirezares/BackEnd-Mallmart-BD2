import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Neo4jConnectionService } from 'src/neo4j-connection/neo4j-connection.service';
import { Session } from 'neo4j-driver';
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
      if (result.records.length===0){
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

  //TODO: Comprar: Al comprar debe guardar la categoria en engagement
  async buyProducts(userEmail: string) {
    const session: Session = await this.neo4jService.getSession();

    //Guardo el carrito en una variable
    const purchase = await this.getProductsOfCart(userEmail)

    // Borro las relaciones que salen de carrito c:Cart - r -> (),
    // las relaciones de ADD_PRODUCT y pongo en 0 el totalAmount y totalQuantity
    try {
    const result = await session.run(
      `MATCH (c:Cart {userEmail: $userEmail})-[r:REGISTER]->()
      SET c.totalAmount = 0, c.totalQuantity = 0
      DELETE r
      WITH c
      MATCH (u:User {userEmail: $userEmail})-[r:ADD_PRODUCT]->(c)
      DELETE r`,
      {userEmail:userEmail}
    )
    return purchase
    } catch {
      await session.close();
      throw new NotFoundException('El producto no fue encontrado');
    }
    
  }
}
