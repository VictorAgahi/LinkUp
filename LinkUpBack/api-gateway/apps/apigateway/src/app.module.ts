import { Module, Scope,MiddlewareConsumer, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RequestModule } from './request/request.module';
import { AuthenticationMiddleware } from './middleware/authentification.middleware';
import { AuthGuard } from './guard/auth.guard';
import { LoggingInterceptor } from './interceptors/logging.interceptors';
import { HttpExceptionFilter } from './filtrer/http-exception.filter';
import { UsersModule } from './users/users.module';

@Module({
  imports: [RequestModule, UsersModule],
  controllers: [AppController],
  providers: 
  [
    AppService, 
    {
    provide: 'APP_GUARD',
    useClass: AuthGuard,
    },
    {
      provide: 'APP_INTERCEPTOR', 
      scope : Scope.REQUEST,
      useClass: LoggingInterceptor,
    },
    {
      provide: 'APP_FILTER',
      useClass: HttpExceptionFilter,
    }
  ],
})
export class AppModule implements NestModule{
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthenticationMiddleware)
      .forRoutes('*');
  }
}
