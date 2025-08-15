// __tests__/convex/clients.test.ts
import { test, expect } from "@jest/globals";
import { ConvexTest } from "convex-test";
import { api } from "../../convex/_generated/api";
import { v } from "convex/values";
import { Id } from "../../convex/_generated/dataModel";

describe("Client Management Convex Functions", () => {
  let testCtx;

  beforeEach(async () => {
    testCtx = new ConvexTest();
    await testCtx.initSchema();
  });

  afterEach(async () => {
    await testCtx.cleanup();
  });

  describe("createClient", () => {
    it("should create a new client successfully", async () => {
      const orgId = await testCtx.runMutation(api.organizations.createOrganization, { name: "Test Org" });
      const clientId = await testCtx.runMutation(api.clients.createClient, {
        orgId,
        name: "John Doe",
        email: "john.doe@example.com",
        phone: "1234567890",
        address: {
          street: "123 Main St",
          city: "Anytown",
          state: "CA",
          zip: "12345",
        },
      });
      expect(clientId).toBeDefined();
      const client = await testCtx.runQuery(api.clients.getClient, { clientId });
      expect(client).toBeDefined();
      expect(client.name).toBe("John Doe");
    });

    it("should throw an error for missing required fields", async () => {
      const orgId = await testCtx.runMutation(api.organizations.createOrganization, { name: "Test Org" });
      await expect(
        testCtx.runMutation(api.clients.createClient, {
          orgId,
          // @ts-expect-error: Missing required fields
          name: "",
          email: "john.doe@example.com",
          phone: "1234567890",
          address: {
            street: "123 Main St",
            city: "Anytown",
            state: "CA",
            zip: "12345",
          },
        }),
      ).rejects.toThrow();
    });
  });

  describe("listClients", () => {
    it("should list clients for an organization", async () => {
      const orgId = await testCtx.runMutation(api.organizations.createOrganization, { name: "Test Org" });
      await testCtx.runMutation(api.clients.createClient, {
        orgId,
        name: "John Doe",
        email: "john.doe@example.com",
        phone: "1234567890",
        address: {
          street: "123 Main St",
          city: "Anytown",
          state: "CA",
          zip: "12345",
        },
      });
      const clients = await testCtx.runQuery(api.clients.listClients, { orgId });
      expect(clients.page.length).toBe(1);
    });
  });

  describe("getClient", () => {
    it("should retrieve a client by ID", async () => {
      const orgId = await testCtx.runMutation(api.organizations.createOrganization, { name: "Test Org" });
      const clientId = await testCtx.runMutation(api.clients.createClient, {
        orgId,
        name: "John Doe",
        email: "john.doe@example.com",
        phone: "1234567890",
        address: {
          street: "123 Main St",
          city: "Anytown",
          state: "CA",
          zip: "12345",
        },
      });
      const client = await testCtx.runQuery(api.clients.getClient, { clientId });
      expect(client).toBeDefined();
      expect(client.name).toBe("John Doe");
    });

    it("should return undefined for non-existent client", async () => {
      const clientId = "non_existent_client_id" as Id<"clients">;
      const client = await testCtx.runQuery(api.clients.getClient, { clientId });
      expect(client).toBeUndefined();
    });
  });

  describe("updateClient", () => {
    it("should update a client successfully", async () => {
      const orgId = await testCtx.runMutation(api.organizations.createOrganization, { name: "Test Org" });
      const clientId = await testCtx.runMutation(api.clients.createClient, {
        orgId,
        name: "John Doe",
        email: "john.doe@example.com",
        phone: "1234567890",
        address: {
          street: "123 Main St",
          city: "Anytown",
          state: "CA",
          zip: "12345",
        },
      });
      await testCtx.runMutation(api.clients.updateClient, {
        clientId,
        update: { name: "Jane Doe" },
      });
      const updatedClient = await testCtx.runQuery(api.clients.getClient, { clientId });
      expect(updatedClient.name).toBe("Jane Doe");
    });

    it("should throw an error for invalid update fields", async () => {
      const orgId = await testCtx.runMutation(api.organizations.createOrganization, { name: "Test Org" });
      const clientId = await testCtx.runMutation(api.clients.createClient, {
        orgId,
        name: "John Doe",
        email: "john.doe@example.com",
        phone: "1234567890",
        address: {
          street: "123 Main St",
          city: "Anytown",
          state: "CA",
          zip: "12345",
        },
      });
      await expect(
        testCtx.runMutation(api.clients.updateClient, {
          clientId,
          // @ts-expect-error: Invalid update fields
          update: { invalidField: "Invalid" },
        }),
      ).rejects.toThrow();
    });
  });

  describe("deleteClient", () => {
    it("should delete a client successfully", async () => {
      const orgId = await testCtx.runMutation(api.organizations.createOrganization, { name: "Test Org" });
      const clientId = await testCtx.runMutation(api.clients.createClient, {
        orgId,
        name: "John Doe",
        email: "john.doe@example.com",
        phone: "1234567890",
        address: {
          street: "123 Main St",
          city: "Anytown",
          state: "CA",
          zip: "12345",
        },
      });
      await testCtx.runMutation(api.clients.deleteClient, { clientId });
      const deletedClient = await testCtx.runQuery(api.clients.getClient, { clientId });
      expect(deletedClient).toBeNull();
    });
  });
});