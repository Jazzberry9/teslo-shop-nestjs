import { createParamDecorator, ExecutionContext } from "@nestjs/common"


export const RawHeaders = createParamDecorator(
    (data: any, ctx: ExecutionContext) => {
        const requ = ctx.switchToHttp().getRequest();
        return requ.rawHeaders
    }
)