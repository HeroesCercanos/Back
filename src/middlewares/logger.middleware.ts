import { Injectable, NestMiddleware } from "@nestjs/common";
import { log } from "console";
import { NextFunction, Request, Response } from "express";

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        console.log(
            `Estas ejecutando un metodo ${req.method} en la url ${req.url} a las ${new Date().toLocaleTimeString()} of ${new Date().toLocaleDateString()}`,
        );
        next();
    }
}

export function loggerGlobal(req: Request, res: Response, next: NextFunction) {
    console.log(
        `Estas ejecutando un metodo ${req.method} en la url ${req.url} a las ${new Date().toLocaleTimeString()} of ${new Date().toLocaleDateString()}`,
    );
    next();
}