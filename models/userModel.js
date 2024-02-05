import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = mongoose.Schema(
  {
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    gender: {
      type: String,
    },
    email: {
      type: String,
    },
    password: {
      type: String,
    },
    bio: {
      type: String,
    },
    profile_photo: {
      type: String,
      default: "",
    },
    canAnalyze: {
      type: Boolean,
      default: false,
    },
    score: {
      type: Number,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    isFollowing: {
      type: Boolean,
      default: false,
    },
    isAccountVerified: {
      type: Boolean,
      default: false,
    },
    viewedBy: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "user",
        },
      ],
    },
    followers: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "user",
        },
      ],
    },
    following: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "user",
        },
      ],
    },
    refresh_token: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  try {
    if (this.isModified("password") || this.isNew) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(this.password, salt);
      this.password = hashedPassword;
    }

    if (!this.profile_photo) {
      switch (this.gender) {
        case "male":
          this.profile_photo =
            "https://static.vecteezy.com/system/resources/previews/017/178/570/original/male-symbol-isolated-icon-on-transparent-background-free-png.png";
          break;
        case "female":
          this.profile_photo =
            "https://static.vecteezy.com/system/resources/previews/018/922/116/original/3d-female-gender-symbol-sign-png.png";
          break;
        case "diverse":
          this.profile_photo =
            "https://cdn-icons-png.flaticon.com/512/4918/4918276.png";
          break;
      }
    }
    next();
  } catch (error) {
    return next(error);
  }
});

userSchema.methods.isPasswordMatched = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const Users = mongoose.model("User", userSchema);
export default Users;
