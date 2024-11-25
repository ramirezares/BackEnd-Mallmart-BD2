import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { Neo4jConnectionService } from 'src/neo4j-connection/neo4j-connection.service';
import { Session } from 'neo4j-driver';
@Injectable()
export class CartService {

  constructor(private readonly neo4jService: Neo4jConnectionService) { }

  async count() {
    const session = await this.neo4jService.getSession();
    try {
      const result = await session.run(
        'MATCH (n:Cart) RETURN count(n)'
      );

      const count = result.records[0].get('count(n)').low;

      return count;

    } catch (error) {
      console.error('Error al ejecutar la query:', error);
    }


  }

  async create(createCartDto: CreateCartDto) {
    const { userEmail, totalAmount, totalQuantity } = createCartDto;

    const cartId = (await this.count() + 1).toString();

    const session: Session = await this.neo4jService.getSession();

    //Valido que el cliente exita
    const userResult = await session.run(
      'MATCH (u:User {userEmail: $userEmail}) RETURN u',
      { userEmail: userEmail }
    );

    if (userResult.records.length === 0) {
      await session.close();
      throw new BadRequestException('El cliente no existe');
    }

    //Valido que el cliente no tenga un carrito
    const cartResult = await session.run(
      'MATCH (c:Cart {userEmail: $userEmail}) RETURN c',
      { userEmail: userEmail }
    );

    if (cartResult.records.length > 0) {
      await session.close();
      throw new BadRequestException('El cliente ya tiene un carrito');
    }
    try {
      const result = await session.run(
        `CREATE (n:Cart {
                    cartId: $cartId, 
                    userEmail: $userEmail, 
                    totalAmount: $totalAmount, 
                    totalQuantity: $totalQuantity
                })
        WITH n
        MATCH (u:User {userEmail: $userEmail}),(n:Cart {userEmail:$userEmail})
        WITH u,n
        CREATE (n)-[:OWNED_BY]->(u)
        RETURN n`,
        {
          cartId: cartId,
          userEmail: userEmail,
          totalAmount: totalAmount,
          totalQuantity: totalQuantity
        }
      );
      return { message: 'Carrito creado correctamente', cart: result.records[0].get('n').properties };

    } catch (error) {
      console.error('Error al ejecutar la query:', error);
    }
  }

  async findOne(userEmail: string) {
    const session: Session = await this.neo4jService.getSession();
    try {
      const result = await session.run(
        'MATCH (c:Cart {userEmail: $userEmail}) RETURN c',
        { userEmail: userEmail }
      );
      const cart = result.records[0].get('c').properties
      return cart

    } catch (error) {
      console.error('Error al ejecutar la query:', error);
    }
  }

  async update(userEmail: string, updateCartDto: UpdateCartDto) {
    const { totalAmount, totalQuantity } = updateCartDto

    const amountToAdd = totalAmount
    const quantityToAdd = totalQuantity

    const session: Session = await this.neo4jService.getSession();

    //Valido que exista el carrito
    const cart = await session.run(
      'MATCH (c:Cart {userEmail: $userEmail}) RETURN c',
      { userEmail: userEmail }
    )
    if (cart.records.length === 0) {
      await session.close();
      throw new NotFoundException('No se encontró el carrito')
    }
    try {
      const result = await session.run(
        `MATCH (c:Cart {userEmail: $userEmail})
         SET c.totalAmount = c.totalAmount + $additionalAmount,
         c.totalQuantity = c.totalQuantity + $additionalQuantity
         RETURN c`,
        {
          userEmail: userEmail,
          additionalAmount: amountToAdd,
          additionalQuantity: quantityToAdd
        }
      )
      return {
        message: 'Carrito actualizado correctamente',
        cart: result.records[0].get('c').properties,
      };
    } catch {
      await session.close()
      throw new InternalServerErrorException('Error al actualizar el carrito')
    }
  }

}
