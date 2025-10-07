import mongoose from "mongoose";

const CartItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true, default: 1 },
  },
  { _id: false } 
);


const CartSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    items: [CartItemSchema],
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);


CartSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});


CartSchema.methods.mergeItems = function (guestItems) {
  if (!Array.isArray(guestItems)) return;

  guestItems.forEach(({ product, quantity }) => {
    if (!product || quantity <= 0) return;

    const existing = this.items.find((i) => i.product.toString() === product.toString());
    if (existing) existing.quantity += quantity;
    else this.items.push({ product, quantity });
  });
};

const Cart = mongoose.models.Cart || mongoose.model("Cart", CartSchema);

export default Cart;
