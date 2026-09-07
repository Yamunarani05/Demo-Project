import { getDashboardLeads } from "./src/controllers/dashboard.controller";
import express from "express";

const req = {} as express.Request;
const res = {
  status: (code) => ({ json: (data) => console.log('Status', code, data) }),
  json: (data) => console.log('JSON', data)
} as express.Response;

async function test() {
  await getDashboardLeads(req, res);
  process.exit(0);
}
test();
