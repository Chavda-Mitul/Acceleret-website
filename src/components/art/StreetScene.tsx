import { LazyArt } from "./LazyArt";
import { Spine } from "@/components/motion/Spine";

/** The street where the work happens, drawn in pencil, with the route connecting every door. */
export function StreetScene() {
  return (
    <div className="art-street">
      {/* under the drawing: hidden behind the shop, it meets the road's route */}
      <Spine />
      <LazyArt
        kind="street"
        ratio="1600 / 470"
        className="art--street"
        label="A pencil drawing of a trading street: a textile shop with bolts of cloth, an office block, a weaving shed, a warehouse, a loaded tempo and an old trading house, with one blue line running along the road and connecting every door."
      />
    </div>
  );
}
