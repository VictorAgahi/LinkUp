import { Module, Scope,MiddlewareConsumer, NestModule } from '@nestjs/common';

import { RequestModule } from './request/request.module';
import { AuthenticationMiddleware } from './middleware/authentification.middleware';
import { AuthGuard } from './guard/auth.guard';
import { LoggingInterceptor } from './interceptors/logging.interceptors';
import { HttpExceptionFilter } from './filtrer/http-exception.filter';
import AuthModule from './auth/auth.module';

@Module({
  imports: [RequestModule,AuthModule ],
  controllers: [],
  providers: 
  [ 
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
