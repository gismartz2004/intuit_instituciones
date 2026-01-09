import { Controller, Get, Post, Body, Param, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UsersService } from './users.service';
import { InsertUser, insertUserSchema } from 'src/shared/schema';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get(':id')
    async getUser(@Param('id') id: string) {
        const user = await this.usersService.getUser(id);
        if (!user) throw new NotFoundException('User not found');
        return user;
    }

    @Post('login')
    async login(@Body() body: any) {
        console.log(`Login Attempt for user: ${body.username}`);
        const user = await this.usersService.validateUser(body.username, body.password);
        if (!user) {
            console.log('Login failed: Invalid credentials or user not found');
            throw new UnauthorizedException('Invalid credentials');
        }
        console.log(`Login successful: ${user.role}`);
        return user;
    }

    // @Post()
    // async createUser(@Body() body: any) {
    //     // Basic validation using Zod schema if not handled by a pipe
    //     const result = insertUserSchema.safeParse(body);
    //     // if (!result.success) {
    //     //     throw new Error('Invalid data');
    //     //     @Get('setup')
    //     //     // async setup() {
    //     //     //     const admin = await this.usersService.ensureAdminExists();
    //     //     //     return { message: 'Admin user verified/created', user: admin };
    //     //     // }
    //     // }
    //     return this.usersService.createUser(result.data);
    // }
    // @Post()
    // async createUser(@Body() body: any) {
    //     // Basic validation using Zod schema if not handled by a pipe
    //     const result: InsertUser = insertUserSchema.safeParse(body);
    //     // if (!result.success) {
    //     //     throw new Error('Invalid data');
    //     //     @Get('setup')
    //     //     // async setup() {
    //     //     //     const admin = await this.usersService.ensureAdminExists();
    //     //     //     return { message: 'Admin user verified/created', user: admin };
    //     //     // }
    //     // }
    //     return this.usersService.createUser(result as InsertUser);
    // }
}
