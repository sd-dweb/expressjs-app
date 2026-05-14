import mongoose from 'mongoose';

export const GoogleUserSchema = new mongoose.Schema({
  id: { type: mongoose.Schema.Types.String, required: true, unique: true },
  displayName: { type: mongoose.Schema.Types.String, required: true, unique: true },
  email: { type: mongoose.Schema.Types.String, required: true, unique: true },
  avatar: { type: mongoose.Schema.Types.String },
});

export const GoogleUser = mongoose.model('GoogleUser', GoogleUserSchema);