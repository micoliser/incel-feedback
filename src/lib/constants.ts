export const SERVICE_OPTIONS = [
  "Flight Booking",
  "Hotel Reservation",
  "Visa Assistance",
  "Holiday / Tour Package",
  "Corporate Travel",
  "Other",
] as const;

export const EXPERIENCE_OPTIONS = [
  "Yes, completely",
  "Mostly",
  "Not really",
  "No",
] as const;

export const STAFF_RATING_OPTIONS = [
  "Excellent",
  "Very Good",
  "Good",
  "Fair",
  "Poor",
] as const;

export const LIKELIHOOD_OPTIONS = [
  "Definitely",
  "Probably",
  "Not sure",
  "No",
] as const;

export type ServiceOption = (typeof SERVICE_OPTIONS)[number];
export type ExperienceOption = (typeof EXPERIENCE_OPTIONS)[number];
export type StaffRatingOption = (typeof STAFF_RATING_OPTIONS)[number];
export type LikelihoodOption = (typeof LIKELIHOOD_OPTIONS)[number];
