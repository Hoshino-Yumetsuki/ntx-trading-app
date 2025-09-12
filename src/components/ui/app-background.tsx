import Image from 'next/image'

export function AppBackground() {
  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[56vh] md:h-[52vh] -z-10"
      >
        <div className="relative w-full h-full">
          <Image
            src="/Frame24@3x.png"
            alt=""
            fill
            priority
            className="object-cover object-center md:object-[20%_top] select-none"
          />
        </div>
      </div>
      {/* 添加浅蓝色背景元素 */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-20 bg-gradient-to-b from-blue-50/30 to-transparent"
      />
    </>
  )
}
