function sum(a, b) {
    return a + b;
}
  
describe("Função sum", () => {
    test("soma 1 + 2 deve resultar em 3", () => {
      expect(sum(1, 2)).toBe(3);
    });
});