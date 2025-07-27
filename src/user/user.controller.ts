import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    NotFoundException,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Put,
    Query,
    Req,
    UseGuards,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { User } from "./entity/user.entity";
import { AuthGuard } from "@nestjs/passport";
import { UpdateUserDto } from "src/auth/dto/update-user.dto";

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
    async findOne(
        @Param("id")
        id: string,
    ): Promise<User> {
        const user = await this.userService.findById(id);

        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found.`);
        }

        return user;
    }

    @Delete(":id")
    remove(@Param("id") id: string): Promise<void> {
        return this.userService.remove(id);
    }

    @Patch(":id")
    updateUser(
        @Param("id", ParseIntPipe) id: string,
        @Body() updateUserDto: UpdateUserDto,
    ): Promise<User> {
        return this.userService.update(id, updateUserDto);
    }
}
