const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  // phone: {
  //   type: String,
  //   required: true,
  //   unique: true,
  //   validate: {
  //     validator: function (v) {
  //       return /^\+?[1-9]\d{1,14}$/.test(v); // Validate phone number format (E.164 standard)
  //     },
  //     message: props => `${props.value} is not a valid phone number!`
  //   }
  // },
  // active: { type: Boolean, default: true },
  // createdAt: { type: Date, default: Date.now },
});

// Pre-save middleware to hash the password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to compare password
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};
UserSchema.index({ email: 1 }, { unique: true });
const User = mongoose.model("User", UserSchema);
module.exports = User;
