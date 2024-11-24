import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Neo4jConnectionService } from 'src/neo4j-connection/neo4j-connection.service';
import { Session } from 'neo4j-driver';
@Injectable()
export class CategoriesService {

  constructor(private readonly neo4jService: Neo4jConnectionService) { }

  async count() {
    const session: Session = await this.neo4jService.getSession();
    try {
      const result = await session.run(
        'MATCH (c:Category) RETURN count(c)'
      );

      const count = result.records[0].get('count(c)').low;

      return count
    } catch (error) {
      console.error('Error al ejecutar la query:', error);
    }
  }

  async findAll() {
    const session: Session = await this.neo4jService.getSession();
    try {
      const result = await session.run(
        'MATCH (c:Category) RETURN c'
      );

      const categoriesArray = result.records.map(record => record.get('c').properties);

      return categoriesArray;
    }
    catch (error) {
      console.error('Error al ejecutar la query:', error);
    }
  }

  async getCatNames() {
    const session: Session = await this.neo4jService.getSession();
    try {
      const result = await session.run(
        'MATCH (c:Category) RETURN c.name'
      );

      const categoriesArray = result.records.map(record => record.get('c.name'));

      return categoriesArray;
    }
    catch (error) {
      console.error('Error al ejecutar la query:', error);
    }
  }

  // Al crear el nombre debe estar todo en minusculas
  async create(CreateCategoryDto: CreateCategoryDto) {
    const { name } = CreateCategoryDto;
    const session: Session = await this.neo4jService.getSession();

    // Validar si no existe la categoria 
    const categoryResult = await session.run(
      'MATCH (c:Category {name: $name }) RETURN c',
      { name: name }
    );
    if (categoryResult.records.length !== 0) {
      await session.close();
      throw new BadRequestException('La categoria ya existe');
    }

    const catNumber = (await this.count() + 1).toString();

    try {
      await session.run(
        'CREATE (c:Category { categoryId: "cat_"+$catNumber, name: $name })',
        {
          catNumber: catNumber,
          name: name
        }
      )
      return { message: 'Categoria creada' };
    } catch (error) {
      console.error('Error al ejecutar la query:', error);
    }
  }

  async findOne(name: string) {
    const session: Session = await this.neo4jService.getSession();

    const result = await session.run(
      'MATCH (c:Category {name: $name}) RETURN c',
      { name: name }
    )

    if (result.records.length === 0) {
      await session.close();
      throw new NotFoundException('La categoria no fue encontrada');
    }

    return result.records[0].get('c').properties;
  }

  async remove(name: string) {
    const session: Session = await this.neo4jService.getSession();
    
    const result = await session.run(
      `MATCH (c:Category {name: $name}) DETACH DELETE c`,
      { name: name }
    );
    if (result.summary.counters["_stats"].nodesDeleted === 0) {
      await session.close();
      throw new NotFoundException('La categoria no fue encontrada');
    }
    return { message: 'Categoria eliminada' };
  }
}
