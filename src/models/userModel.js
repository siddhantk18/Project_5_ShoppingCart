const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const validator = require("validator");
const ErrorHandler = require("../errorHandler/errorHandlingClass");

const userSchema = new mongoose.Schema(
  {
    fname: {
      type: String,
      required: [true, "Please provide your first name"],
    },
    lname: {
      type: String,
      required: [true, "Please provide your last name"],
    },
    email: {
      type: String,
      required: [true, "Please provide your email-ID"],
      unique: true,
      validate: [validator.isEmail, "Please provide a valid email"],
    },
    profileImage: {
      type: String,
      required: [true, "Please provide your profile image"],
    },
    phone: {
      type: String,
      required: [true, "Please provide your mobile number"],
      unique: true,
      validate: {
        validator: function (mobile) {
          const re = /^((\+91)?|91)?[6789][0-9]{9}$/;
          return re.test(mobile);
        },
        message: "Please provide a valid mobile number",
      },
    },
    password: {
      type: String,
      required: [true, "Please provide the password"],
      minlength: 8,
      maxlength: 15,
    },
    address: { type: Object },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  this.password = await bcrypt.hash(this.password, 12);
  this.address = JSON.parse(this.address);
  const { address } = this;
  if (!address.shipping || !address.billing) {
    return next(
      new ErrorHandler(400, "Please provide both shipping and billing address")
    );
  }
  if (
    !address.shipping.street ||
    !address.billing.street ||
    !address.shipping.city ||
    !address.billing.city ||
    !address.shipping.pincode ||
    !address.billing.pincode
  ) {
    return next(
      new ErrorHandler(
        400,
        "Please provide street, city and pincode all three parameters in both shipping and billing address"
      )
    );
  }
  next();
});
userSchema.methods.correctPassword = async function (
  givenPassword,
  savedPassword
) {
  return bcrypt.compare(givenPassword, savedPassword);
};
// eslint-disable-next-line new-cap
module.exports = new mongoose.model("User", userSchema);
