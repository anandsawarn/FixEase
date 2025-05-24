import React from "react";
import { Outlet, useParams, useNavigate } from "react-router-dom";
import { servicesData } from "../../data/servicesData"; // You'll need to create this

const ServicePage = () => {
  const { serviceName } = useParams();
  const navigate = useNavigate();

  // If directly accessing /services without a specific service
  if (!serviceName) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Our Services</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {servicesData.map((service) => (
            <div 
              key={service.id}
              className="border rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/services/${service.path}`)}
            >
              <h2 className="text-xl font-semibold">{service.name}</h2>
              <p className="text-gray-600 mt-2">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Render the specific service component
  return <Outlet />;
};

export default ServicePage;