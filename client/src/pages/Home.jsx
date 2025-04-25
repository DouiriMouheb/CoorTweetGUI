export default function Home() {
  return (
    <div className="bg-white">
      <div className="relative  my-30 flex items-center justify-center  bg-gradient-to-r from-[#ff80b5] to-[#9089fc]">
        <div
          aria-hidden="true"
          className="absolute inset-x-0 -top-5 -z-5 transform-gpu overflow-hidden blur-3xl sm:-top-20"
        >
          <div
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
            className="relative left-[calc(50%-5.5rem)] aspect-1155/678 w-[18.0625rem] -translate-x-1/2 rotate-[30deg] bg-linear-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-15rem)] sm:w-[36.09375rem]"
          />
        </div>
        <div className="mx-auto max-w-2xl py-8 sm:py-12 lg:py-14">
          <div className="text-center">
            <h1 className="text-3xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
              Coordinated Sharing Behavior Detection
            </h1>
            {/*<p className="mt-4 text-sm text-black-500 sm:text-lg">
              Coordinated Sharing Detection Service
            </p> */}

            <div className="mt-5 flex items-center justify-center gap-x-3">
              <a
                href="/login"
                className="rounded-md bg-indigo-600 px-2.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Get started
              </a>
              <a
                href="/Learnmore"
                className="text-xs font-semibold text-gray-900"
              >
                Learn more <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </div>
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-[calc(100%-6.5rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-15rem)]"
        >
          <div
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
            className="relative left-[calc(50%+1.5rem)] aspect-1155/678 w-[18.0625rem] -translate-x-1/2 bg-linear-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%+18rem)] sm:w-[36.09375rem]"
          />
        </div>
      </div>
    </div>
  );
}
