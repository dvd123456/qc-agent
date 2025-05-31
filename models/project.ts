import mongoose, { Schema, Document } from "mongoose";

export interface TestCase {
  testCaseId: string;
  module: string;
  title: string;
  preconditions: string;
  testSteps: string[];
  expectedResult: string;
  actualResult: string;
  priority: "High | Medium | Low";
  remarks: string;
}

export interface ProjectDocument extends Document {
  name: string;
  metadata?: {
    description?: string;
    startDate?: Date;
    endDate?: Date;
  };
  summary?: string;
  testCase: TestCase[];
  createdAt: Date;
  updatedAt: Date;
  status: string;
  priority: string;
  userId: string;
}

const ProjectSchema = new Schema<ProjectDocument>(
  {
    name: { type: String, required: true },
    metadata: {
      description: String,
      startDate: Date,
      endDate: Date,
    },
    summary: { type: String, default: "" },
    testCase: { type: [Object], default: [] },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    status: { type: String, default: "active" },
    priority: { type: String, default: "medium" },
    userId: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Project ||
  mongoose.model<ProjectDocument>("Project", ProjectSchema);
