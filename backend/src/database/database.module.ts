import { Module, Global } from '@nestjs/common';
import { drizzleProvider } from './drizzle.provider';

@Global()
@Module({
    providers: [drizzleProvider],
    exports: [drizzleProvider],
})
export class DatabaseModule { }
