import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { Neo4jConnectionService } from 'src/neo4j-connection/neo4j-connection.service';
import { Session } from 'neo4j-driver';
import { AddToCartDto } from './dto/addToCart-product.dto';

@Injectable()
export class ProductsService {

  constructor(private readonly neo4jService: Neo4jConnectionService) { }

  async count() {
    const session: Session = await this.neo4jService.getSession();
    try {
      const result = await session.run(
        'MATCH (n:Product) RETURN count(n)'
      );

      const count = result.records[0].get('count(n)').low;

      return count
    } catch (error) {
      console.error('Error al ejecutar la query:', error);
    }
  }

  async findAll() {
    const session: Session = await this.neo4jService.getSession();
    try {
      const result = await session.run(
        'MATCH (n:Product) RETURN n'
      );

      const productsArray = result.records.map(record => record.get('n').properties);

      return productsArray;
    }
    catch (error) {
      console.error('Error al ejecutar la query:', error);
    }
  }

  async create(createProductDto: CreateProductDto) {
    const { name, description, price, categoryID, rating, image } = createProductDto;

    const productId = (await this.count() + 1).toString();

    const session: Session = await this.neo4jService.getSession();

    // Validar si existe la categoria 
    const categoryResult = await session.run(
      'MATCH (c:Category {categoryId: $categoryID}) RETURN c',
      { categoryID: categoryID }
    );
    if (categoryResult.records.length === 0) {
      await session.close();
      throw new BadRequestException('La categoria no existe');
    }
    //Valido que no exista el nombre textualmente
    const productResult = await session.run(
      'MATCH (p:Product {name: $name}) RETURN p',
      { name: name }
    )
    if (productResult.records.length > 0) {
      await session.close();
      throw new ConflictException('El producto ya existe');
    }
    try {
      const result = await session.run(
        `CREATE (p:Product {
                productId: $productId, 
                name: $name, 
                description: $description, 
                price: $price, 
                categoryID: $categoryID, 
                rating: $rating, 
                image: $image})
        WITH p
        MATCH (c:Category {categoryId: $categoryID})
        CREATE (p)-[:BELONGS_TO]->(c)
        RETURN p
        `,
        {
          productId: productId,
          name: name,
          description: description,
          price: price,
          categoryID: categoryID,
          rating: rating,
          image: image
        }
      )
      return { message: 'Producto creado exitosamente', product: result.records[0].get('p').properties };
    } catch (error) {
      await session.close()
      throw new InternalServerErrorException('Error al obtener los productos del carrito')
    }
  }

  async findOne(id: string) {
    const session: Session = await this.neo4jService.getSession();

    const result = await session.run(
      'MATCH (p:Product {productId: $id}) RETURN p',
      { id: id }
    )

    if (result.records.length === 0) {
      await session.close();
      throw new NotFoundException('El producto no fue encontrado');
    }

    return result.records[0].get('p').properties;
  }

  async remove(id: string) {
    const session: Session = await this.neo4jService.getSession();
    const result = await session.run(
      `MATCH (p:Product {productId:$id}) DETACH DELETE p`,
      { id: id }
    );
    if (result.summary.counters["_stats"].nodesDeleted === 0) {
      await session.close();
      throw new NotFoundException('El producto no fue encontrado');
    }
    return { message: 'Producto eliminado' };
  }

  async getTopFive() {
    const session: Session = await this.neo4jService.getSession();
    try {
      const result = await session.run(
        'MATCH (p:Product) RETURN p ORDER BY p.rating DESC LIMIT 5'
      )

      return result.records.map(record => record.get('p').properties);
    }
    catch (error) {
      console.error('Error al ejecutar la query:', error);
    }
  }

  async findByCategoryID(categoryID: string) {
    const session: Session = await this.neo4jService.getSession();

    //Verifico si existe 
    const resultCategory = await session.run(
      'MATCH (p:Product {categoryID:$categoryID}) RETURN p',
      { categoryID: categoryID }
    )
    if (resultCategory.records.length === 0) {
      await session.close();
      throw new NotFoundException('La categoria no fue encontrada');
    }
    try {
      const result = await session.run(
        `MATCH (p:Product)-[:BELONGS_TO]->(c:Category {categoryId: $categoryID})
         RETURN p`,
        { categoryID: categoryID }
      )
      const products = result.records.map(record => record.get('p').properties);

      return products;

    } catch {
      await session.close()
      throw new InternalServerErrorException('Error al obtener los productos del carrito')
    }
  }

  async addToCart(addToCartDto: AddToCartDto) {
    const { userEmail, productId, dateAdded, quantity } = addToCartDto
    const session: Session = await this.neo4jService.getSession();

    //Valido que exista el usuario
    const userResult = await session.run(
      'MATCH (u:User {userEmail:$userEmail}) RETURN u',
      { userEmail: userEmail })
    if (userResult.records.length === 0) {
      await session.close()
      throw new NotFoundException('El usuario no fue encontrado')
    }
    //Valido que exista el carrito
    const cartResult = await session.run(
      'MATCH (c:Cart {userEmail: $userEmail}) RETURN c',
      { userEmail: userEmail }
    )
    if (cartResult.records.length === 0) {
      await session.close();
      throw new NotFoundException('No se encontró el carrito')
    }
    //Verifico si el producto existe
    const product = await session.run(
      'MATCH (p:Product {productId: $productId}) RETURN p',
      { productId: productId }
    )
    if (product.records.length === 0) {
      await session.close();
      throw new NotFoundException('No se encontró el producto')
    }
    try {
      //Verifico si el producto ya esta en el carrito
      const result = await session.run(
        `MATCH (c:Cart {userEmail:$userEmail})-[r:REGISTER]->(p:Product {productId:$productId})
      RETURN r`,
        { userEmail: userEmail, productId: productId }
      )
      if (result.records.length > 0) {
        //Si el producto ya esta en el carrito sumo 1 al atributo quantity
        const resultAddingMore = await session.run(
          `MATCH (c:Cart {userEmail:$userEmail})-[r:REGISTER]->(p:Product {productId: $productId})
        SET r.registerDate = $dateAdded , r.quantity = r.quantity + 1`
          ,
          { userEmail: userEmail, productId: productId, dateAdded: dateAdded }
        )
        await session.close()
        return { message: 'Producto agregado exitosamente' };
      }
      //Si no esta en el carrito lo agrego
      else {
        //Agrego al carrito del usuario
        const result = await session.run(
          `MATCH (u:User {userEmail:$userEmail}),
                 (c:Cart {userEmail:$userEmail}),
                 (p:Product {productId:$productId})
           CREATE (u)-[:ADD_PRODUCT {dateAdded: $dateAdded}]->(c)
           WITH c, p
           CREATE (c)-[:REGISTER {registerDate: $dateAdded, quantity: 1}]->(p)`,
          { userEmail: userEmail, productId: productId, dateAdded: dateAdded, quantity: quantity }
        )
        await session.close()
        return { message: 'Producto agregado exitosamente' };
      }
    } catch {
      await session.close()
      throw new InternalServerErrorException("Error agregando el producto al carrito")
    }
  }
}
