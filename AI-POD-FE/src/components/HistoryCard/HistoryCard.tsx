const HistoryCard = ({ history, downloadReport }: any) => {
	const labelColorMap: Record<string, string> = {
		skin: 'bg-blue-100 text-blue-600',
		eye: 'bg-purple-100 text-purple-600',
		wound: 'bg-red-100 text-red-600',
	};

	const confidenceColorMap = [
		{ min: 85, class: 'bg-green-500' },
		{ min: 60, class: 'bg-yellow-400' },
		{ min: 0, class: 'bg-red-500' },
	];

	const createdAt = history.created_at?.split('T')[0] || '';
	const confidenceClass = confidenceColorMap.find(
		(c) => Math.round(history.confidence * 100) >= c.min
	)?.class;

	return (
		<div
			key={history.id}
			className="bg-card-light/50 backdrop-blur-md rounded-xl p-4 shadow-xl shadow-slate-900/10 flex flex-col"
		>
			<img
				src={history.image}
				alt={history.original_name}
				className="rounded-lg h-40 object-cover mb-4"
			/>
			<div className="flex justify-between items-center mb-2">
				<span
					className={`text-xs px-2 py-1 rounded-full font-semibold ${
						labelColorMap[history.label?.toLowerCase()] ||
						'bg-gray-100 text-gray-600'
					}`}
				>
					{history.image_type}
				</span>
				<span className="text-xs text-gray-500">{createdAt}</span>
			</div>
			<h3 className="font-semibold text-lg mb-1">{history.prediction}</h3>
			<div className="w-full rounded-full mb-2 flex items-center justify-between">
                <div className="bg-gray-200 h-2.5" style={{width:'80%'}}>
                    <div
                        className={`h-2.5 rounded-full ${confidenceClass}`}
                        style={{ width: `${Math.round(history.confidence * 100)}%` }}
                    />
                </div>
                <span className="text-sm text-right text-gray-700 font-medium">
                    {Math.round(history.confidence * 100)}%
                </span>
			</div>
			<button className="flex w-full justify-center rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-hover cursor-pointer mt-4"
                onClick={downloadReport}>
				Download Report
			</button>
		</div>
	);
};

export default HistoryCard;
