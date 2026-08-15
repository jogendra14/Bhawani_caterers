export const queryKeys = {
  orders: {
    all: ["orders"],
    detail: (id) => ["orders", id],
    menu: (id) => ["orders", id, "menu"],
  },
  items: {
    all: ["items"],
  },
  materials: {
    all: ["materials"],
  },
};
