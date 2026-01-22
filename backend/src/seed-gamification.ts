import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GamificationService } from './modules/student/services/gamification.service';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);

    const gamificationService = app.get(GamificationService);

    console.log('🌱 Seeding initial achievements...');
    await gamificationService.seedInitialAchievements();
    console.log('✅ Achievements seeded successfully');

    console.log('🌱 Seeding initial missions...');
    await gamificationService.seedInitialMissions();
    console.log('✅ Missions seeded successfully');

    await app.close();
    console.log('🎉 Seed completed!');
}

bootstrap().catch(err => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
});
