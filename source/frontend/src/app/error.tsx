'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="p-6">
          <h2 className="text-xl font-semibold">Đã xảy ra lỗi</h2>
          <p className="mt-2 text-gray-600">{error.message}</p>
          <button className="mt-4 px-4 py-2 border" onClick={() => reset()}>Thử lại</button>
        </div>
      </body>
    </html>
  );
}
