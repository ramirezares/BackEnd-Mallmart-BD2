import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { Neo4jConnectionService } from 'src/neo4j-connection/neo4j-connection.service';
import { JwtService } from '@nestjs/jwt';
import { Session } from 'neo4j-driver';
import { NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {

  constructor(
    private readonly neo4jService: Neo4jConnectionService,
    private readonly jwtService: JwtService
  ) { }

  async register(createUserDto: CreateUserDto) {
    const { userEmail, firstName, lastName, password, address } = createUserDto;

    const session: Session = await this.neo4jService.getSession();

    // Verifico si ya existe
    const alreadyRegisteredResult = await session.run(
      'MATCH (u:User {userEmail: $userEmail}) RETURN u',
      { userEmail: userEmail }
    );
    if (alreadyRegisteredResult.records.length > 0) {
      await session.close();
      throw new NotFoundException('Usuario ya registrado');
    }

    // Encripto la contraseña
    const encryptedPassword = await bcrypt.hash(password, 10); //bcrypt.hashSync(password, 10);

    //Creamos el usuario
    const result = await session.run(
      'CREATE (u:User {userEmail: $userEmail, firstName: $firstName, lastName: $lastName, password: $encryptedPassword, address: $address}) RETURN u',
      { userEmail, firstName, lastName, encryptedPassword, address }
    )

    const user = result.records[0].get('u').properties;

    // Genero el token
    const payload = { userEmail: user.userEmail, sub: user.id };
    const accessToken = this.jwtService.sign(payload,);
    await session.close();

    return { ...user, accessToken };
  }

  private async verifyWithPassword(userEmail: string, password: string): Promise<any> {
    const session: Session = await this.neo4jService.getSession();
    const result = await session.run(
      'MATCH (u:User {userEmail: $userEmail}) RETURN u',
      { userEmail },
    );
    await session.close();

    if (result.records.length === 0) {
      return null;
    }

    const user = result.records[0].get('u').properties;

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (isPasswordValid) {
      return user;
    }
    
    await session.close();
    throw new BadRequestException('Usuario o contraseña invalidos');
  }

  async verifyByUserEmail(userEmail: string): Promise<any> {
    const session: Session = await this.neo4jService.getSession();
    const result = await session.run(
      'MATCH (u:User {userEmail: $userEmail}) RETURN u',
      { userEmail },
    );
    await session.close();

    if (result.records.length === 0) {
      return null;
    }

    return result.records[0].get('u').properties;
  }

  async findOne(userEmail: string) {
    const session: Session = await this.neo4jService.getSession();

    const result = await session.run(
      'MATCH (u:User {userEmail: $userEmail}) RETURN u',
      { userEmail: userEmail }
    );

    if (result.records.length === 0) {
      await session.close();
      throw new NotFoundException('Usuario no encontrado');
    }

    const user = result.records[0].get('u').properties;

    return [user.userEmail, user.firstName]; 
  }

  async remove(userEmail: string) {
    const session: Session = await this.neo4jService.getSession();
    
    const result = await session.run(
      'MATCH (u:User {userEmail: $userEmail}) DETACH DELETE u', 
      { userEmail: userEmail }
    );

    if(result.summary.counters["_stats"].nodesDeleted === 0){
      await session.close();
      throw new NotFoundException('Usuario no encontrado');
    }

    return { message: 'Usuario eliminado' };
  }

  async login(loginUserDto: LoginUserDto) {
    const { userEmail, password } = loginUserDto;

    const user = await this.verifyWithPassword(userEmail, password);

    if (user == null) {
      throw new UnauthorizedException('Usuario o contraseña invalidos');
    }

    const payload = { userEmail: user.userEmail, sub: user.id };
  
    return { 
      accessToken: this.jwtService.sign(payload),
    };
    
  }
}
