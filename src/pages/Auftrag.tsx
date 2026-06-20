import { FunnelFrame } from "@/components/FunnelFrame";

const Auftrag = () => (
  <FunnelFrame
    title="Wechselauftrag"
    src="/loaders/auftrag.html"
    requireUuid
    showChrome={false}
  />
);

export default Auftrag;
