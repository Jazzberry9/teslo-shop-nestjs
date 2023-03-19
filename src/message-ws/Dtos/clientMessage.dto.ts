import { IsString, MinLength } from "class-validator";


export class MessageFromClient {

    @IsString()
    @MinLength(1)
    msg: string;
}