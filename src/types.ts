import { POINT_OF_INTEREST } from "./constants";

type ValuesOf<T> = T[keyof T];
type PointOfInterest = typeof POINT_OF_INTEREST;
export type PointOfInterestValues = number[];

export type Coordinates = [number, number];
