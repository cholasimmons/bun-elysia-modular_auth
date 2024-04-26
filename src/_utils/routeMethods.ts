import { Route } from './BaseController';

interface ResponseOptions {
  body?: {}; //  validate incoming body.
  query?: {}; // validate query string or URL parameters.
  params?: {}; // validate path parameters.
  header?: {}; // validate request's headers.
  response?: {}; // validate response type.
  beforeHandle?: (ctx: any) => 'unauthorized' | string | undefined; // before handling the request
}

function useBefore(handler: any) {
  return function (target: any) {
    if (!target.prototype.middlewares) {
      target.prototype.middlewares = [];
    }
    target.prototype.middlewares.push(handler);
  };
}

function Get(path: string, responseOptions: ResponseOptions = {}) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    if (!target.routes) {
      target.routes = [];
    }

    target.routes.push({
      method: 'get',
      path,
      handler: descriptor.value,
      responseOptions,
    });
  };
}

function Post(path: string, responseOptions: ResponseOptions = {}) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    if (!target.routes) {
      target.routes = [];
    }
    target.routes.push({
      method: 'post',
      path,
      handler: descriptor.value,
      responseOptions,
    });
  };
}
function Put(path: string, responseOptions: ResponseOptions = {}) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    if (!target.routes) {
      target.routes = [];
    }
    target.routes.push({
      method: 'put',
      path,
      handler: descriptor.value,
      responseOptions,
    });
  };
}
function Delete(path: string, responseOptions: ResponseOptions = {}) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    if (!target.routes) {
      target.routes = [];
    }
    target.routes.push({
      method: 'delete',
      path,
      handler: descriptor.value,
      responseOptions,
    });
  };
}

export { Get, Post, Put, Delete, useBefore };