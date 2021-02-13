import { Router } from "express";

export default interface RestController {
  path: string;
  router: Router;
}