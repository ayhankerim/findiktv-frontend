import { AmbientColor } from '@/components/decorations/ambient-color';
import DynamicZoneManager from '@/components/dynamic-zone/manager'

export default function PageContent({ pageData }: { pageData: any }) {
  const dynamicZone = pageData?.contentSections;
  return (
    <div className="grow relative overflow-hidden w-full">
      <AmbientColor />
      {dynamicZone && (<DynamicZoneManager dynamicZone={dynamicZone} locale={pageData.locale} />)}
    </div>
  );
}
