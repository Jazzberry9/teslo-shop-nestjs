import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { User } from '../auth/entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

interface ConnectedClients{
    // es de tipo string y apunta a un socket
    [id: string]: {
        socket: Socket,
        user: User
    }
}

@Injectable()
export class MessageWsService {

    private connectedClients: ConnectedClients = {}

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>
    ){}
    
    
    async registerClient( client: Socket, userId: string){

        const user = await this.userRepository.findOneBy({id: userId});

        if( !user ) throw new Error('User not found') 
        if( !user.isActive ) throw new Error('User not active') 

        this.checkUserConnection( user )

        // crea un obj dentro de connectedClients con el id como nombre de obj y la info que tiene es client
        this.connectedClients[client.id] = {
            socket: client,
            user
        }
    }
    removeClient( clientId: string){
        delete this.connectedClients[clientId]
    }

    getConnectedClients():string[] {
        return Object.keys( this.connectedClients);
    }

    getUserFullName(socketId: string){
        return this.connectedClients[socketId].user.fullName
    }

    private checkUserConnection( user:User ){

        for (const clientId of Object.keys(this.connectedClients)) {
            
            const clientsConnectedNow = this.connectedClients[clientId];

            if( clientsConnectedNow.user.id === user.id){
                clientsConnectedNow.socket.disconnect();
                break;
            }

        }
    }

}
