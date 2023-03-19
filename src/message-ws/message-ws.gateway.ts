import { JwtService } from '@nestjs/jwt';
import { MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtPayload } from '../auth/interfaces';
import { MessageFromClient } from './Dtos/clientMessage.dto';
import { MessageWsService } from './message-ws.service';

@WebSocketGateway({ cors: true})
export class MessageWsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  
  @WebSocketServer() server: Server
  
  constructor(
    private readonly messageWsService: MessageWsService,
    private readonly jwtService: JwtService
  ) {}

  async handleConnection(client: Socket) {

    const token = <string>client.handshake.headers.authentication;
    let payload: JwtPayload;

    try {
      payload = this.jwtService.verify( token );        
      await this.messageWsService.registerClient(client, payload.id)

    } catch (error) {
      client.disconnect()
      return;
    }
    // console.log({payload});
    this.server.emit('updated-client', this.messageWsService.getConnectedClients())
  }

  handleDisconnect(client: Socket) {
    // console.log('Cliente desconectado', client.id );
    this.messageWsService.removeClient(client.id)

    this.server.emit('updated-client', this.messageWsService.getConnectedClients())
  }

  @SubscribeMessage('message-from-client')
  // obtengo solo el mensaje
  // handleEventClient(@MessageBody('msg') messageFromClient: MessageFromClient){
  //   console.log({messageFromClient});
  // }
  // Obtengo mas datos
  handleEventClient(client: Socket, messageFromClient: MessageFromClient){
    
    //! emite unicamente al cliente actual, no a todos.

    // client.emit('message-from-server', {
    //   fullName: 'Soy es yo',
    //   msg: messageFromClient.msg || ''
    // })

    // emite a todos, menos al cliente que lo manda

    // client.broadcast.emit('message-from-server', {
    //   fullName: 'Soy es yo',
    //   msg: messageFromClient.msg || ''
    // })

    // emite a todos, incluido el cliente que lo manda
    this.server.emit('message-from-server', {
      fullName: this.messageWsService.getUserFullName(client.id),
      msg: messageFromClient.msg || ''
    })
  }
}
