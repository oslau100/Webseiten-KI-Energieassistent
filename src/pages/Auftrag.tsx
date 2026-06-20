import { FunnelFrame } from "@/components/FunnelFrame";

const Auftrag = () => (
  <FunnelFrame
    title="Wechselauftrag"
    src="/loaders/auftrag.html"
    requireUuid
    showChrome={false}
    showSimpleFooter
  />
);

export default Auftrag;
