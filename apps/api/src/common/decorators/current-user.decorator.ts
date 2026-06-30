import { createParamDecorator, ExecutionContext } from "@nestjs/common";

/**
 * Extracts the current authenticated user from the request.
 * Use in controller methods: @CurrentUser() user: TokenPayload
 */
export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return data ? user?.[data] : user;
  }
);
