import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Layers } from 'lucide-react';

type DataStorageProps = {
  data: Record<string, any>;
};

export default function DataStorage({ data }: DataStorageProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          <Layers /> Unified Telemetry Log
        </CardTitle>
        <CardDescription>Sample of aggregated logs from your services.</CardDescription>
      </CardHeader>
      <CardContent>
        <pre className="mt-2 h-[200px] w-full overflow-auto rounded-md bg-muted p-4 text-sm">
          <code>{JSON.stringify(data, null, 2)}</code>
        </pre>
      </CardContent>
    </Card>
  );
}
