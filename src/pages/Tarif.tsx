import { FunnelFrame } from "@/components/FunnelFrame";

const Tarif = () => (
  <FunnelFrame
    title="Ihr Tarifangebot"
    src="/loaders/tarif.html"
    requireUuid
    showChrome={false}
    showSimpleFooter
  />
);

export default Tarif;
