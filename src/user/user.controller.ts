import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    Query,
    Req,
    UseGuards,
} from "@nestjs/common";
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

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() data: Partial<User>): Promise<User> {
        return this.userService.create(data);
    }

    @Post("me/location")
    @UseGuards(AuthGuard("jwt"))
    updateLocation(
        @Req() req,
        @Body() dto: { latitude: number; longitude: number },
    ) {
        return this.userService.update(req.user.sub, dto);
    }

    @Get(":id")
    findOne(@Query("id") id: string): Promise<User> {
        return this.userService.update(id, {} as Partial<User>);
    }

    @Delete(":id")
    remove(@Param("id") id: string): Promise<void> {
        return this.userService.remove(id);
    }
}
