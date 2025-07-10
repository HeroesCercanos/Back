import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { UserService } from "./user.service";
import { User } from "./entity/user.entity";
import { AuthGuard } from "@nestjs/passport";

@Controller("users")
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get()
    async getAll(): Promise<User[]> {
        return this.userService.findAll();
    }

    @Post("me/location")
    @UseGuards(AuthGuard("jwt"))
    updateLocation(
        @Req() req,
        @Body() dto: { latitude: number; longitude: number },
    ) {
        return this.userService.update(req.user.sub, dto);
    }

    
}
