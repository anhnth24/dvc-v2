export default function DocumentDetailPage({ params }: { params: { id: string } }) {
  return <div>Document ID: {params.id}</div>;
}
