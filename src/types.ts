import { POINT_OF_INTEREST_COORDINATES } from "./constants";

type ValuesOf<T> = T[keyof T];
type PointOfInterest = typeof POINT_OF_INTEREST_COORDINATES;
export type PointOfInterestValues = number[];

export type Coordinates = [number, number];
