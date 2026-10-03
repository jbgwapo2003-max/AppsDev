import { Discovery } from "@/components/discovery";
import { spotSummaries } from "@/lib/mock-data";

export default function Home() {
  return <Discovery initialSpots={spotSummaries} />;
}
