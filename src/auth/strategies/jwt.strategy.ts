import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { InjectRepository } from "@nestjs/typeorm";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Repository } from "typeorm";
import { User } from "../entities/user.entity";
import { JwtPayload } from "../interfaces/jwt.interface";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,

        configService: ConfigService
    ){
        super({
            secretOrKey: configService.get('JWT_SECRET'),
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
        })
    }
    // aqui se guardo el usuario en la request, retornando el user.
    // esto se llama si no ha expirado y si la firma del JWT hace match con el payload
    async validate(payload: JwtPayload): Promise<User>{
        // validando el payload

        const { id } = payload
        const user = await this.userRepository.findOneBy({id})

        if (!user)
            throw new UnauthorizedException('Invalid Token')
        
        if (!user.isActive)
            throw new UnauthorizedException('Inactive user, talk with an admin')

        return user;      
        
    }

}