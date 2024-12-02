
export const Advertisement = ({ position, adformat } : { position?: string, adformat?: string }) => {
    return (
      <div>{position} {adformat}</div>
    );
};
