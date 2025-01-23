import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

//set salt work factor?

interface InterfaceUser extends Document {
  email: string;
  password: string;
  name: string;
  savedPackingList: mongoose.Schema.Types.ObjectId[];
}

const userSchema = new Schema<InterfaceUser>({
  email: {
    type: String,
    unique: true,
    required: false,
    validate: {
      validator: function (v) {
        return /\S+@\S+\.\S+/.test(v);
      },
      message: (props) => `${props.value} is not a valid email.`,
    },
  },
  password: { type: String, required: true },
  name: { type: String, required: true },
  savedPackingList: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'PackingList' },
  ],
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model<InterfaceUser>('User', userSchema);
export default User;
