import { assert, expect, it, vi } from "vitest";
import { mock } from "vitest-mock-extended";
import { Snap } from ".";
import { Requester } from "../requester";
import { TransactionBuilder } from "../transaction";

it("creates a transaction", async () => {
  const MOCK_TOKEN = "mocktoken";
  const MOCK_REDIRECT_URL = "mockurl";

  const snapRequester = mock<Requester>({
    post: vi.fn().mockResolvedValue({
      token: MOCK_TOKEN,
      redirect_url: MOCK_REDIRECT_URL,
    }),
  });
  const coreRequester = mock<Requester>();

  const snap = new Snap({
    snapRequester,
    coreRequester,
    accessKeys: {
      serverKey: "mockserverkey",
      merchantId: "mockmerchantid",
    },
  });

  const payload = new TransactionBuilder()
    .setCustomer({
      first_name: "John",
      last_name: "Doe",
      email: "a@a.com",
      phone: "08123456789",
    })
    .setDetails({
      order_id: "mockorder",
      gross_amount: 100_000,
    })
    .build();

  const transaction = await snap.createTransaction(payload);

  assert.strictEqual(transaction.token, MOCK_TOKEN);
  assert.strictEqual(transaction.redirect_url, MOCK_REDIRECT_URL);

  expect(snapRequester.post).toHaveBeenCalledWith("/snap/v1/transactions", payload);
});
