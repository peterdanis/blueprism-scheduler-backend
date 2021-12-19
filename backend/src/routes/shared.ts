import { NextFunction, Request, Response } from "express";
import CustomError from "../utils/customError";
import toInteger from "../utils/toInteger";

export const del = <T>(idName: string, fn: (id: number) => Promise<T>) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      // eslint-disable-next-line security/detect-object-injection
      const id = req.params[idName];
      if (id) {
        const parsedId = toInteger(id);
        if (parsedId) {
          await fn(parsedId);
        }
      }
      res.status(200).json({});
    } catch (error: any) {
      const msg: string = error.message;
      if (
        /The DELETE statement conflicted with the REFERENCE constraint/.test(
          msg,
        )
      ) {
        next(
          new CustomError(
            "Can not delete, entity is probably still used elsewhere, or contains other entities.",
            422,
          ),
        );
        return;
      }
      next(error);
    }
  };
};

export const update = <T>(
  idName: string,
  getFn: (id: number) => Promise<T | undefined>,
  updateFn: (entity: T) => Promise<T>,
  type: string,
) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      // eslint-disable-next-line security/detect-object-injection
      const id = req.params[idName];
      let result: T | undefined;
      if (id) {
        const parsedId = toInteger(id);
        if (parsedId) {
          result = await getFn(parsedId);
        }
      }
      if (!result) {
        throw new CustomError(`${type} not found`, 404);
      }
      const updatedResult = await updateFn(Object.assign(result, req.body));
      res.status(200).json(updatedResult);
    } catch (error) {
      next(error);
    }
  };
};

export const getOne = <T>(
  idName: string,
  fn: (id: number) => Promise<T | undefined>,
  type: string,
) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      // eslint-disable-next-line security/detect-object-injection
      const id = req.params[idName];
      let result: T | undefined;
      if (id) {
        const parsedId = toInteger(id);
        if (parsedId) {
          result = await fn(parsedId);
        }
        if (!result) {
          throw new CustomError(`${type} not found`, 404);
        }
        res.status(200).json(result);
      }
    } catch (error) {
      next(error);
    }
  };
};

export const getMany = <T>(
  fn: (arg?: Partial<T>) => Promise<T>,
  optionsOrConditions?: Partial<T>,
) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      let result: T;
      if (optionsOrConditions) {
        result = await fn(optionsOrConditions);
      } else {
        result = await fn();
      }
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
};

export const create = <T>(
  fn: (arg: Partial<T>) => Promise<T>,
  type: string,
) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const result = await fn(req.body);
      res.status(201).json(result);
    } catch (error: any) {
      const msg: string = error.message;
      if (/NULL/.test(msg)) {
        next(
          new CustomError(
            `${type} can not be created, a required parameter is missing`,
            422,
          ),
        );
        return;
      }
      next(error);
    }
  };
};
