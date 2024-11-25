import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Neo4jConnectionService } from 'src/neo4j-connection/neo4j-connection.service';
import { Session } from 'neo4j-driver';

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
      console.error('Error al ejecutar la query:', error);
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
}
