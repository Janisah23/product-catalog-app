const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export const formatPrice = (amount: number) => money.format(amount);
