'use client';

interface NoMailsProps {
  message: {
    heading: string;
    subHeading: string;
  };
}

const NoMails = ({ message }: NoMailsProps) => {
  return (
    <div className="flex flex-col w-full items-center justify-center mt-20 px-4">
      <div className="max-w-md text-center">
        <p className="text-xl text-[#202124] font-normal mb-2">
          {message.heading}
        </p>
        {message.subHeading && (
          <p className="text-sm text-[#5F6368] leading-relaxed">
            {message.subHeading}
          </p>
        )}
      </div>
    </div>
  );
};

export default NoMails;


